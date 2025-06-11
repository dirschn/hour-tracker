class HourlyRatesController < ApplicationController
  before_action :set_hourly_rate, only: %i[ show update destroy ]

  # GET /hourly_rates
  # GET /hourly_rates.json
  def index
    @hourly_rates = HourlyRate.all
  end

  # GET /hourly_rates/1
  # GET /hourly_rates/1.json
  def show
  end

  # POST /hourly_rates
  # POST /hourly_rates.json
  def create
    @hourly_rate = HourlyRate.new(hourly_rate_params)

    if @hourly_rate.save
      render :show, status: :created, location: @hourly_rate
    else
      render json: @hourly_rate.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /hourly_rates/1
  # PATCH/PUT /hourly_rates/1.json
  def update
    if @hourly_rate.update(hourly_rate_params)
      render :show, status: :ok, location: @hourly_rate
    else
      render json: @hourly_rate.errors, status: :unprocessable_entity
    end
  end

  # DELETE /hourly_rates/1
  # DELETE /hourly_rates/1.json
  def destroy
    @hourly_rate.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_hourly_rate
      @hourly_rate = HourlyRate.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def hourly_rate_params
      params.expect(hourly_rate: [:user_position_id, :hourly_rate_cents])
    end
end
