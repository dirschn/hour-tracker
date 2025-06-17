class EmploymentsController < ApplicationController
  before_action :authenticate_user!
  before_action :find_employment, only: %i[clock_in clock_out]
  
  def clock_in
    if @employment.shifts.active.exists?
      flash[:alert] = 'Already clocked in for this employment'
      redirect_and_respond_to_clock_action
      return
    end
    
    @shift = @employment.shifts.create(date: Date.current, start_time: Time.current)
    if @shift.persisted?
      flash[:notice] = 'Successfully clocked in!'
      redirect_and_respond_to_clock_action
    else
      flash[:alert] = @shift.errors.full_messages.join(', ')
      redirect_and_respond_to_clock_action
    end
  end

  def clock_out
    @shift = @employment.shifts.active.first
    unless @shift
      flash[:alert] = 'No active shift to clock out of'
      redirect_and_respond_to_clock_action
      return
    end
    
    if @shift.update(end_time: Time.current)
      flash[:notice] = "Successfully clocked out! Worked #{@shift.hours_worked.round(2)} hours."
      redirect_and_respond_to_clock_action
    else
      flash[:alert] = @shift.errors.full_messages.join(', ')
      redirect_and_respond_to_clock_action
    end
  end

  private

  def find_employment
    @employment = current_user.employments.find(params[:id])
  end
  
  def redirect_and_respond_to_clock_action
    respond_to do |format|
      format.turbo_stream { render :clock_action }
      format.html { redirect_to dashboard_path }
      format.json do
        if flash[:notice]
          render json: { message: flash[:notice] }, status: :ok
        else
          render json: { errors: [flash[:alert]] }, status: :unprocessable_entity
        end
      end
    end
  end
end
