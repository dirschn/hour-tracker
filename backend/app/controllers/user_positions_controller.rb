class UserPositionsController < ApplicationController
  before_action :set_user_position, only: %i[ show update destroy ]

  # GET /user_positions
  # GET /user_positions.json
  def index
    @user_positions = UserPosition.all
  end

  # GET /user_positions/1
  # GET /user_positions/1.json
  def show
  end

  # POST /user_positions
  # POST /user_positions.json
  def create
    @user_position = UserPosition.new(user_position_params)

    if @user_position.save
      render :show, status: :created, location: @user_position
    else
      render json: @user_position.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /user_positions/1
  # PATCH/PUT /user_positions/1.json
  def update
    if @user_position.update(user_position_params)
      render :show, status: :ok, location: @user_position
    else
      render json: @user_position.errors, status: :unprocessable_entity
    end
  end

  # DELETE /user_positions/1
  # DELETE /user_positions/1.json
  def destroy
    @user_position.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user_position
      @user_position = UserPosition.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def user_position_params
      params.expect(user_position: [:user_id, :position_id, :start_date])
    end
end
