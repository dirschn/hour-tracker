class Employment < ApplicationRecord
  belongs_to :user
  belongs_to :position
  has_many :shifts, dependent: :destroy
  has_many :hourly_rates, dependent: :destroy

  accepts_nested_attributes_for :position, update_only: true

  validates :user_id, uniqueness: { scope: :position_id }
  validates :start_date, presence: true

  scope :active, -> { where(end_date: [nil, '']).or(where('end_date > ?', Date.current)) }

  def active?
    end_date.nil? || end_date >= Date.today
  end
end
