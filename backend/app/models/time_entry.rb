class TimeEntry < ApplicationRecord
  belongs_to :employment

  validates :date, :start_time, presence: true
  validates :end_time, comparison: { greater_than: :start_time }, allow_nil: true

  def active?
    end_time.blank?
  end

  def hours_worked
    return 0.0 unless end_time
    minutes = ((end_time - start_time) / 60.0).round
    quarters = (minutes / 15.0).ceil
    quarters * 0.25
  end
end
