json.extract! shift, :id, :employment_id, :start_time, :end_time, :date, :description, :notes, :created_at, :updated_at
json.hours shift.hours_worked
json.active shift.active?
