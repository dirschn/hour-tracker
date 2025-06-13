class Company < ApplicationRecord
  has_many :positions, dependent: :destroy
  has_many :employments, through: :positions
  has_many :employees, through: :employments, source: :user

  validates :name, presence: true, uniqueness: true
end
