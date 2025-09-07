class Employment < ApplicationRecord
  belongs_to :user
  belongs_to :position
  has_many :shifts, dependent: :destroy
  has_many :hourly_rates, dependent: :destroy

  enum :round_mode, { exact: 0, quarter_hour: 1, half_hour: 2, custom: 3 }

  validates :round_mode, presence: true
  validates :round_interval, presence: true, numericality: { greater_than: 0 }, if: -> { round_mode == 'custom' }

  accepts_nested_attributes_for :position

  validates :user_id, uniqueness: { scope: :position_id }
  validates :start_date, presence: true

  scope :active, -> { where(end_date: [nil, '']).or(where('end_date > ?', Date.current)) }

  def active?
    end_date.nil? || end_date >= Date.today
  end
end
