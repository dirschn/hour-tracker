json.extract! time_entry, :id, :user_position_id, :minutes_worked, :date, :created_at, :updated_at
json.url time_entry_url(time_entry, format: :json)
