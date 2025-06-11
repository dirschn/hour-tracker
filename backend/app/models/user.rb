class User < ApplicationRecord
  has_many :user_positions, dependent: :destroy
  has_many :positions, through: :user_positions
  has_many :companies, through: :positions
  has_many :time_entries, dependent: :destroy
end
