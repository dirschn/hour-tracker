class DashboardController < ApplicationController
  def show
    # Get current user
    user = current_user

    # Active employments
    @active_employments = user.employments.active

    # Date range for current week (Monday to today)
    week_start = Date.today.beginning_of_week(:monday)
    week_end = Date.today

    # Weekly hours and shifts per employment
    @weekly_hours = @active_employments.map do |employment|
      shifts = employment.shifts.where(date: week_start..week_end)
      hours = shifts.sum { |te| te.hours_worked }
      {
        employment: employment,
        shifts: shifts,
        hours: hours
      }
    end

    @total_hours = @weekly_hours.sum { |wh| wh[:hours] }

    # Current open shift (shift with no end_time)
    @current_shift = user.employments.joins(:shifts).merge(Shift.where(end_time: nil)).first&.shifts&.find_by(end_time: nil)
  end
end
