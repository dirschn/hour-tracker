class Position < ApplicationRecord
  belongs_to :company

  has_many :employments, dependent: :destroy
  has_many :employees, through: :employments, source: :user
  has_many :shifts, through: :employments

  accepts_nested_attributes_for :company

  validates :title, presence: true, uniqueness: { scope: :company_id }
  validates :rounding_interval, presence: true, numericality: { greater_than: 0 }

  enum rounding_rule: {
    quarter_hour: 0,
    half_hour: 1,
    exact: 2,
    custom: 3
  }

  # Calculate hours based on position's rounding rule
  def calculate_hours(start_time, end_time)
    return 0.0 unless start_time && end_time
    
    minutes = ((end_time - start_time) / 60.0).round
    return 0.0 if minutes <= 0
    
    case rounding_rule
    when 'quarter_hour'
      calculate_quarter_hour_rounding(minutes)
    when 'half_hour'
      calculate_half_hour_rounding(minutes)
    when 'exact'
      calculate_exact_hours(minutes)
    when 'custom'
      calculate_custom_rounding(minutes)
    else
      calculate_exact_hours(minutes)
    end
  end

  private

  def calculate_quarter_hour_rounding(minutes)
    quarters = (minutes / 15.0).ceil
    quarters * 0.25
  end

  def calculate_half_hour_rounding(minutes)
    half_hours = (minutes / 30.0).ceil
    half_hours * 0.5
  end

  def calculate_exact_hours(minutes)
    (minutes / 60.0).round(2)
  end

  def calculate_custom_rounding(minutes)
    return calculate_exact_hours(minutes) unless rounding_interval && rounding_interval > 0
    
    intervals = (minutes / rounding_interval.to_f).ceil
    (intervals * rounding_interval) / 60.0
  end
end
