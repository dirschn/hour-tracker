class HourlyRate < ApplicationRecord
  belongs_to :user_position

  monetize :rate_cents
end
