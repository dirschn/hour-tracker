class DashboardController < ApplicationController
  def show
    @active_employments = User.find(current_user.id).employments.active.includes(position: :company)

    week_start = Date.current.beginning_of_week(:sunday)
    week_end = Date.current.end_of_week(:sunday)

    @shifts = Shift.where(date: week_start..week_end, employment_id: @active_employments.pluck(:id))
    @total_weekly_hours = @shifts.group_by(&:employment_id).transform_values do |shifts|
      shifts.sum { |shift| shift.hours_worked }.round(2)
    end

    # Calculate daily totals per employment
    @daily_hours = @shifts.group_by { |shift| [shift.date, shift.employment_id] }
                          .transform_values { |shifts| shifts.sum(&:hours_worked).round(2) }

    @current_shifts = @shifts.active
  end
end
