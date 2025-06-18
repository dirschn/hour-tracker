class EmploymentsController < ApplicationController
  before_action :find_employment, only: %i[show update destroy clock_in clock_out]

  def index
    @employments = current_user.employments.includes(:position, position: :company)
  end

  def show; end

  def create
    @employment = current_user.employments.build(employment_params)

    if @employment.save
      render :show, status: :created
    else
      render json: { errors: @employment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @employment.update(employment_params)
      render :show, status: :ok
    else
      render json: { errors: @employment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @employment.destroy
    head :no_content
  end

  def clock_in
    if @employment.shifts.active.exists?
      render json: { errors: ['Already clocked in for this employment'] }, status: :unprocessable_entity
      return
    end
    shift = @employment.shifts.create(date: Date.current, start_time: Time.current)
    if shift.persisted?
      render partial: 'shifts/shift', locals: { shift: shift }, status: :created
    else
      render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def clock_out
    shift = @employment.shifts.active.first
    unless shift
      render json: { errors: ['No active shift to clock out of'] }, status: :unprocessable_entity
      return
    end
    if shift.update(end_time: Time.current)
      render partial: 'shifts/shift', locals: { shift: shift }, status: :ok
    else
      render json: { errors: shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def find_employment
    @employment = current_user.employments.find(params[:id])
  end

  def employment_params
    params.require(:employment).permit(:position_id, :start_date, :end_date)
  end
end
