json.user do
  json.extract! @user, :id, :first_name, :last_name, :username, :email
  json.name [@user.first_name, @user.last_name].join(' ')
end
