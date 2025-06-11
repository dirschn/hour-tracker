class Company < ApplicationRecord
  has_many :positions, dependent: :destroy
  has_many :user_positions, through: :positions
  has_many :users, through: :user_positions
  has_many :time_entries, through: :user_positions

  validates :name, presence: true, uniqueness: true
end
