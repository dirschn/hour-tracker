class HourlyRate < ApplicationRecord
  belongs_to :user_position

  monetize :rate_cents

  validates :rate_cents, presence: true, numericality: { greater_than: 0 }
  validates :effective_date, presence: true
end
