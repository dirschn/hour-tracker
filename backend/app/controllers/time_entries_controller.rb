class TimeEntriesController < ApplicationController
  before_action :set_time_entry, only: %i[ show update destroy ]

  # GET /time_entries
  # GET /time_entries.json
  def index
    @time_entries = TimeEntry.all
  end

  # GET /time_entries/1
  # GET /time_entries/1.json
  def show
  end

  # POST /time_entries
  # POST /time_entries.json
  def create
    @time_entry = TimeEntry.new(time_entry_params)

    if @time_entry.save
      render :show, status: :created, location: @time_entry
    else
      render json: @time_entry.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /time_entries/1
  # PATCH/PUT /time_entries/1.json
  def update
    if @time_entry.update(time_entry_params)
      render :show, status: :ok, location: @time_entry
    else
      render json: @time_entry.errors, status: :unprocessable_entity
    end
  end

  # DELETE /time_entries/1
  # DELETE /time_entries/1.json
  def destroy
    @time_entry.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_time_entry
      @time_entry = TimeEntry.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def time_entry_params
      params.expect(time_entry: [ :user_position_id, :minutes_worked, :date ])
    end
end
