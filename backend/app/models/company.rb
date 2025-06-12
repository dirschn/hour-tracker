class Company < ApplicationRecord
  has_many :positions, dependent: :destroy
  has_many :user_positions, through: :positions
  has_many :users, through: :user_positions
  has_many :time_entries, through: :user_positions

  has_many :roles, dependent: :destroy
  has_many :user_roles, dependent: :destroy

  validates :name, presence: true, uniqueness: true
end
