json.user do
  json.partial! '/users/user', user: @user
  json.employments @user.employments do |employment|
    json.partial! 'employments/employment', employment: employment
    json.position do
      json.partial! 'positions/position', position: employment.position
    end
    json.company do
      json.partial! 'companies/company', company: employment.position.company
    end
  end
end
