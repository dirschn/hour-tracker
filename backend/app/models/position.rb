class Position < ApplicationRecord
  belongs_to :company
  has_many :user_positions, dependent: :destroy
  has_many :users, through: :user_positions
  has_many :time_entries, through: :user_positions

  validates :title, presence: true, uniqueness: { scope: :company_id }
end
