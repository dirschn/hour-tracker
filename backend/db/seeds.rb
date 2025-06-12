# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'faker'

puts 'Seeding database...'

# Clear existing data in development
if Rails.env.development?
  puts 'Clearing existing data...'
  TimeEntry.destroy_all
  UserPosition.destroy_all
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
user_positions = []
users.each do |user|
  # Each user has 1-3 positions
  selected_positions = positions.sample(rand(1..3))

  selected_positions.each_with_index do |position, index|
    start_date = Faker::Date.between(from: 8.months.ago, to: 4.months.ago)
    end_date = index == 0 ? nil : Faker::Date.between(from: start_date + 1.month, to: 1.month.ago)

    user_position = UserPosition.create!(
      user: user,
      position: position,
      start_date: start_date,
      end_date: end_date,
      created_at: start_date
    )

    user_positions << user_position

    # Create initial hourly rate for this position
    HourlyRate.create!(
      user_position: user_position,
      rate_cents: Faker::Number.number(digits: 4),
      effective_date: start_date,
      created_at: start_date
    )
  end
end

# Create Groups for organizing time entries
puts 'Creating groups...'
groups = []
colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

users.each do |user|
  rand(2..4).times do |i|
    groups << Group.create!(
      user: user,
      name: Faker::Company.unique.buzzword,
      description: Faker::Lorem.sentence,
      color: colors[i % colors.length],
      created_at: Faker::Time.between(from: user.created_at, to: 2.months.ago)
    )
  end
end

# Create Time Entries
puts 'Creating time entries...'
user_positions.each do |user_position|
  next if user_position.end_date && user_position.end_date < 2.months.ago

  user_groups = groups.select { |g| g.user_id == user_position.user_id }

  # Create entries for the last 8 weeks
  start_date = user_position.end_date || 8.weeks.ago.to_date
  end_date = [user_position.end_date, Date.current].compact.min

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
      user: user_position.user,
      user_position: user_position,
      minutes_worked: hours * 60,
      date: date,
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
    minutes_worked: (entry.minutes_worked / 60 + rand(2.0..4.0).round(2)) * 60,
    notes: "#{entry.notes} - Overtime work".strip
  )
end

# Add some shorter days
recent_entries.sample(recent_entries.count / 15).each do |entry|
  entry.update!(
    minutes_worked: [entry.minutes_worked / 60 - rand(1.0..3.0), 1.0].max.round(2),
    notes: "#{entry.notes} - Half day".strip
  )
end

puts "\nSeed data created successfully!"
puts "#{User.count} users created"
puts "#{Company.count} companies created"
puts "#{Position.count} positions created"
puts "#{UserPosition.count} user positions created"
puts "#{Group.count} groups created"
puts "#{TimeEntry.count} time entries created"

# Display some sample data
puts "\nSample user with their positions and recent hours:"
sample_user = User.includes(:positions, :companies, :time_entries).first
puts "#{sample_user.first_name} #{sample_user.last_name} (#{sample_user.email})"
puts "Companies: #{sample_user.companies.pluck(:name).join(', ')}"
puts "Positions: #{sample_user.positions.pluck(:title).join(', ')}"

recent_hours = sample_user.time_entries.where(date: 1.week.ago..Date.current).sum(:minutes_worked)
puts "Hours worked in the last week: #{recent_hours.round(2) / 60}"

total_hours = sample_user.time_entries.sum(:minutes_worked)
puts "Total hours tracked: #{total_hours.round(2) / 60}"
