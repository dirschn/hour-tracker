json.shifts @shifts do |shift|
  json.partial! 'shifts/shift', shift: shift
end

json.active_employments @active_employments do |employment|
  json.partial! 'employments/employment', employment: employment

  json.position do
    json.partial! 'positions/position', position: employment.position
  end
  json.company do
    json.partial! 'companies/company', company: employment.position.company
  end
end

json.total_weekly_hours @total_weekly_hours

json.daily_hours do
  @daily_hours.each do |(date, employment_id), hours|
    json.set! "#{date}_#{employment_id}", hours
  end
end

json.current_shifts @current_shifts do |shift|
  json.partial! 'shifts/shift', shift: shift
end
