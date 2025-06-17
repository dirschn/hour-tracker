class ProfilesController < ApplicationController
  before_action :set_user, only: [:show, :update]


  def show
    if @user.blank?
      render json: { error: 'User not found' }, status: :not_found
    end
  end

  def update
    if @user.update(profile_params)
      render :show, status: :ok
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.expect(profile: %i[first_name last_name email username])
  end

  def set_user
    @user = User.includes(:employments, employments: [:position, position: :company]).find(current_user.id)
  end
end
