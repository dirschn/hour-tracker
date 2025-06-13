json.shifts @shifts do |shift|
  json.partial! 'shifts/shift', shift:
end

json.active_employments @active_employments do |employment|
  json.partial! 'employments/employment', employment:
end

json.total_weekly_hours @total_weekly_hours


json.current_shifts @current_shifts do |shift|
  json.partial! 'shifts/shift', shift:
end
