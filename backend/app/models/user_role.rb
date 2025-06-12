class UserRole < ApplicationRecord
  belongs_to :user
  belongs_to :role
  belongs_to :company

  validates :user_id, :role_id, :company_id, presence: true
end
