class ShiftsController < ApplicationController
  before_action :find_shift, only: %i[show update destroy]

  def show; end

  def update
    if @shift.update(shift_params)
      render :show, status: :ok
    else
      render json: { errors: @shift.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @shift.destroy
    head :no_content
  end

  private

  def shift_params
    params.expect(shift: [:date, :start_time, :end_time, :employment_id, :description, :notes])
  end

  def find_shift
    @shift = Shift.find(params[:id])
  end
end
