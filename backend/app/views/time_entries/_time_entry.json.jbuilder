json.extract! time_entry, :id, :employment_id, :start_time, :end_time, :date, :created_at, :updated_at
json.url time_entry_url(time_entry, format: :json)
json.hours time_entry.hours_worked
json.active time_entry.active?
