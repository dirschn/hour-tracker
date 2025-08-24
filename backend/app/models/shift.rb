class Shift < ApplicationRecord
  belongs_to :employment
  belongs_to :position

  validates :date, :start_time, presence: true
  validates :end_time, comparison: { greater_than: :start_time }, allow_nil: true
  validate :only_one_active_shift, if: -> { end_time.blank? }

  scope :active, -> { where(end_time: nil) }
  scope :for_date, ->(date) { where(date:) }
  scope :for_employment, ->(employment_id) { where(employment_id:) }
  scope :chronological, -> { order(start_time: :asc) }
  scope :recent, -> { order(start_time: :desc) }

  def active?
    end_time.blank?
  end

  def hours_worked
    return 0.0 unless end_time

    # Use position's rounding rule through employment
    position = employment.position
    position.calculate_hours(start_time, end_time)
  end

  private

  def only_one_active_shift
    if Shift.where(employment_id:, end_time: nil).where.not(id:).any?
      errors.add(:base, 'There can only be one active shift at a time per employment')
    end
  end
end
