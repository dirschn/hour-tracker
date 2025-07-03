json.shift do
  json.partial! 'shifts/shift', shift: @shift

  json.employment do
    json.partial! 'employments/employment', employment: @shift.employment
    json.position do
      json.partial! 'positions/position', position: @shift.employment.position
    end
    json.company do
      json.partial! 'companies/company', company: @shift.employment.position.company
    end
  end

  json.hours @shift.hours_worked
  json.active @shift.active?
end
