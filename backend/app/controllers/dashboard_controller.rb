class DashboardController < ApplicationController
  before_action :authenticate_user!

  def show
    @active_employments = current_user.employments.active.includes(:position => :company)

    week_start = Date.current.beginning_of_week(:sunday)
    week_end = Date.current.end_of_week(:sunday)

    @shifts = Shift.where(date: week_start..week_end, employment_id: @active_employments.pluck(:id))
    @total_weekly_hours = @shifts.group_by(&:employment_id).transform_values do |shifts|
      shifts.sum { |shift| shift.hours_worked }
    end

    @current_shifts = @shifts.active

    respond_to do |format|
      format.html
      format.json
    end
  end
end
