class TimeEntry < ApplicationRecord
  belongs_to :user_position
  belongs_to :user
  belongs_to :group, optional: true

  validates :minutes_worked, presence: true, numericality: { greater_than: 0, less_than_or_equal_to: 1440 }
  validates :date, presence: true
  validates :user_id, uniqueness: { scope: [:user_position_id, :date] }

  has_rich_text :notes

  scope :for_week, ->(date) { where(date: date.beginning_of_week..date.end_of_week) }
  scope :for_month, ->(date) { where(date: date.beginning_of_month..date.end_of_month) }
end
