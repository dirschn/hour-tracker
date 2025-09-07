class Shift < ApplicationRecord
  belongs_to :employment

  validates :date, :start_time, presence: true
  validates :end_time, comparison: { greater_than: :start_time }, allow_nil: true
  validate :only_one_active_shift, if: -> { end_time.blank? }

  scope :active, -> { where(end_time: nil) }
  scope :for_date, ->(date) { where(date:) }
  scope :for_employment, ->(employment_id) { where(employment_id:) }
  scope :chronological, -> { order(start_time: :asc) }
  scope :recent, -> { order(start_time: :desc) }

  delegate :round_mode, to: :employment
  delegate :round_interval, to: :employment

  def active?
    end_time.blank?
  end

  def hours_worked
    end_time = self.end_time || Time.current
    if round_mode == 'exact'
      ((end_time - start_time) / 1.hour).round(2)
    elsif round_mode == 'custom' && round_interval.present? && round_interval > 0
      round_to_nearest_interval(round_interval)
    elsif round_mode == 'quarter_hour'
      round_to_nearest_interval(15)
    elsif round_mode == 'half_hour'
      round_to_nearest_interval(30)
    end
  end

  private
  def round_to_nearest_interval(interval)
    end_time = self.end_time || Time.current
    total_minutes = ((end_time - start_time) / 60).to_i
    partials = total_minutes / interval
    remainder = total_minutes % interval
    rounded_minutes = if remainder >= (interval / 2.0).round
                        (partials + 1) * interval
                      else
                        partials * interval
                      end
    (rounded_minutes / 60.0).round(2)
  end

  def only_one_active_shift
    if Shift.where(employment_id:, end_time: nil).where.not(id:).any?
      errors.add(:base, 'There can only be one active shift at a time per employment')
    end
  end
end
