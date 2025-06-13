class DashboardController < ApplicationController
  def show
    @active_employments = User.first.employments.active
    @shifts = Shift.where(employment_id: @active_employments.pluck(:id))

    week_start = Date.current.beginning_of_week(:sunday)
    week_end = Date.current.end_of_week(:sunday)

    @total_weekly_hours = @shifts
      .where(shifts: { date: week_start..week_end })
      .sum(&:hours_worked)
    @current_shifts = @shifts.active
  end
end
