class UserPosition < ApplicationRecord
  belongs_to :user
  belongs_to :position
  has_many :time_entries, dependent: :destroy
  has_many :hourly_rates, dependent: :destroy

  validates :user_id, uniqueness: { scope: :position_id }
  validates :start_date, presence: true
end
