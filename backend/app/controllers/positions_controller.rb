class PositionsController < ApplicationController
  before_action :set_position, only: %i[ show update destroy ]

  # GET /positions
  # GET /positions.json
  def index
    @positions = Position.all
  end

  # GET /positions/1
  # GET /positions/1.json
  def show
  end

  # POST /positions
  # POST /positions.json
  def create
    @position = Position.new(position_params)

    if @position.save
      render :show, status: :created, location: @position
    else
      render json: @position.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /positions/1
  # PATCH/PUT /positions/1.json
  def update
    if @position.update(position_params)
      render :show, status: :ok, location: @position
    else
      render json: @position.errors, status: :unprocessable_entity
    end
  end

  # DELETE /positions/1
  # DELETE /positions/1.json
  def destroy
    @position.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_position
      @position = Position.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def position_params
      params.expect(position: [:name])
    end
end
