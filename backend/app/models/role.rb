class Role < ApplicationRecord
  ADMIN = 'admin'
  MANAGER = 'manager'
  USER = 'user'
  GUEST = 'guest'
  ROLES = [ADMIN, MANAGER, USER, GUEST].freeze

  belongs_to :company
  has_many :user_roles, dependent: :destroy
  has_many :users, through: :user_roles

  validates :name, presence: true, uniqueness: { scope: :company_id }, inclusion: { in: ROLES }
end
