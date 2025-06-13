json.extract! user, :id, :first_name, :last_name, :username, :email, :created_at, :updated_at
json.name [user.first_name, user.last_name].join(' ')
