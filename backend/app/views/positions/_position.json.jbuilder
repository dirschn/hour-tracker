json.extract! position, :id, :title, :company_id, :created_at, :updated_at
json.company do
  json.extract! position.company, :id, :name, :description if position.company
end
json.url position_url(position, format: :json)
