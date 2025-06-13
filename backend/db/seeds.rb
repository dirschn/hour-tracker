# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'faker'

puts 'Seeding database...'

# Clear existing data in development
if Rails.env.development?
  puts 'Clearing existing data...'
  TimeEntry.destroy_all
  Employment.destroy_all
  Position.destroy_all
  Company.destroy_all
  User.destroy_all
end

# Create Users
puts 'Creating users...'
users = []
10.times do
  users << User.create!(
    email: Faker::Internet.unique.email,
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    username: Faker::Internet.unique.username,
    created_at: Faker::Time.between(from: 6.months.ago, to: 1.month.ago),
    password: 'password',
    password_confirmation: 'password'
  )
end

# Create Companies
puts 'Creating companies...'
companies = []
company_types = ['Tech', 'Consulting', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']
15.times do
  companies << Company.create!(
    name: "#{Faker::Company.name} #{company_types.sample}",
    description: Faker::Company.catch_phrase,
    created_at: Faker::Time.between(from: 2.years.ago, to: 6.months.ago)
  )
end

# Create Positions
puts 'Creating positions...'
positions = []

companies.each do |company|
  rand(2..6).times do
    positions << Position.create!(
      company: company,
      title: Faker::Job.unique.title,
      description: Faker::Lorem.paragraph(sentence_count: 3),
      remote: [true, false].sample,
      created_at: Faker::Time.between(from: company.created_at, to: 3.months.ago)
    )
  end
end

# Create User Positions (assign users to positions)
puts 'Creating user positions...'
employments = []
users.each do |user|
  # Each user has 1-3 positions
  selected_positions = positions.sample(rand(1..3))

  selected_positions.each_with_index do |position, index|
    start_date = Faker::Date.between(from: 8.months.ago, to: 4.months.ago)
    end_date = index == 0 ? nil : Faker::Date.between(from: start_date + 1.month, to: 1.month.ago)

    employment = Employment.create!(
      user: user,
      position: position,
      start_date: start_date,
      end_date: end_date,
      created_at: start_date
    )

    employments << employment

    # Create initial hourly rate for this position
    HourlyRate.create!(
      employment: employment,
      rate_cents: Faker::Number.number(digits: 4),
      effective_date: start_date,
      created_at: start_date
    )
  end
end

# Create Time Entries
puts 'Creating time entries...'
employments.each do |employment|
  next if employment.end_date && employment.end_date < 2.months.ago

  # Create entries for the last 8 weeks
  start_date = employment.end_date || 8.weeks.ago.to_date
  end_date = [employment.end_date, Date.current].compact.min

  (start_date..end_date).each do |date|
    # Skip weekends for most entries (80% chance)
    next if date.saturday? || date.sunday? && rand < 0.8

    # 70% chance of working on any given weekday
    next if rand > 0.7

    hours = case date.wday
            when 1..5 # Monday to Friday
                     [4, 6, 8, 8, 8, 8, 9, 10].sample + rand(0.0..2.0).round(2)
            else # Weekend
                     [2, 3, 4, 5].sample + rand(0.0..1.0).round(2)
            end

    TimeEntry.create!(
      employment: employment,
      date: date,
      start_time: date + rand(6..10).hours + rand(0..59).minutes,
      end_time: date + rand(15..19).hours + rand(0..59).minutes,
      description: [
        'Project development and coding',
        'Client meetings and communication',
        'Code review and testing',
        'Documentation and planning',
        'Bug fixes and maintenance',
        'Research and learning',
        'Team collaboration',
        'Administrative tasks'
      ].sample,
      notes: rand < 0.3 ? Faker::Markdown.unordered_list : nil,
      created_at: date + rand(9..17).hours
    )
  end
end

# Create some overtime and varied schedules
puts 'Adding varied work patterns...'
recent_entries = TimeEntry.where(date: 4.weeks.ago..Date.current)

# Add some longer days (overtime)
recent_entries.sample(recent_entries.count / 10).each do |entry|
  entry.update!(
    end_time: entry.end_time + rand(1.0..3.0).hours,
    notes: "#{entry.notes} - Overtime work".strip
  )
end

# Add some shorter days
recent_entries.sample(recent_entries.count / 15).each do |entry|
  entry.update!(
    end_time: entry.start_time + rand(1.0..4.0).hours,
    notes: "#{entry.notes} - Half day".strip
  )
end

puts "\nSeed data created successfully!"
puts "#{User.count} users created"
puts "#{Company.count} companies created"
puts "#{Position.count} positions created"
puts "#{Employment.count} user positions created"
puts "#{TimeEntry.count} time entries created"

# Display some sample data
puts "\nSample user with their positions and recent hours:"
sample_user = User.includes(:positions, :companies, :time_entries).first
puts "#{sample_user.first_name} #{sample_user.last_name} (#{sample_user.email})"
puts "Companies: #{sample_user.companies.pluck(:name).join(', ')}"
puts "Positions: #{sample_user.positions.pluck(:title).join(', ')}"

recent_hours = sample_user.time_entries.where(date: 1.week.ago..Date.current).map(&:hours_worked).sum
puts "Hours worked in the last week: #{recent_hours}"

total_hours = sample_user.time_entries.map(&:hours_worked).sum
puts "Total hours tracked: #{total_hours}"
