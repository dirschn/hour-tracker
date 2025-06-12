json.time_entries @time_entries do |time_entry|
  json.partial! 'time_entries/time_entry', time_entry: time_entry
  json.position do
    json.partial! 'positions/position', position: time_entry.position
    json.company do
      json.partial! 'companies/company', company: time_entry.position&.company
    end
  end
end

