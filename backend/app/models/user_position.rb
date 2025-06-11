class UserPosition < ApplicationRecord
  belongs_to :user
  belongs_to :position
  has_many :time_entries, dependent: :destroy

  validates :user_id, uniqueness: { scope: :position_id }
  validates :hourly_rate, presence: true, numericality: { greater_than: 0 }
  validates :start_date, presence: true
end
