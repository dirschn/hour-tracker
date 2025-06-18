json.partial! 'employment', employment: @employment

json.position do
  json.partial! 'positions/position', position: @employment.position
end

json.company do
  json.partial! 'companies/company', company: @employment.position.company
end
