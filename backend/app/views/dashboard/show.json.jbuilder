json.shifts @shifts do |shift|
  json.partial! 'shifts/shift', shift: shift
  json.position do
    json.partial! 'positions/position', position: shift.position
    json.company do
      json.partial! 'companies/company', company: shift.position&.company
    end
  end
end

json.active_employments @active_employments do |employment|
  json.id employment.id
  json.company_name employment.position&.company&.name
  json.position employment.position&.title
  json.hourly_rate employment.hourly_rates.last&.rate
end

json.weekly_hours @weekly_hours do |wh|
  employment = wh[:employment]
  json.employment_id employment.id
  json.company_name employment.position&.company&.name
  json.position employment.position&.title
  json.hours wh[:hours]
  json.shifts wh[:shifts] do |shift|
    json.id shift.id
    json.start_time shift.start_time
    json.end_time shift.end_time
    json.duration shift.hours_worked
    json.notes shift.notes
  end
end

json.total_hours @total_hours

if @current_shift
  json.current_shift do
    json.id @current_shift.id
    json.employment_id @current_shift.employment_id
    json.start_time @current_shift.start_time
    json.notes @current_shift.notes
  end
else
  json.current_shift nil
end
