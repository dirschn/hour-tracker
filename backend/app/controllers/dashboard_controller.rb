class DashboardController < ApplicationController
  def show
    @active_employments = User.first.employments.active

    week_start = Date.current.beginning_of_week(:sunday)
    week_end = Date.current.end_of_week(:sunday)

    @shifts = Shift.where(date: week_start..week_end, employment_id: @active_employments.pluck(:id))
    @total_weekly_hours = @shifts.group_by(&:employment_id).transform_values do |shifts|
      shifts.sum { |shift| shift.hours_worked }
    end

    @current_shifts = @shifts.active
  end
end
