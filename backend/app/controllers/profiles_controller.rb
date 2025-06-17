class ProfilesController < ApplicationController
  def show
    @user = User.includes(:employments, employments: [:position, position: :company]).find(current_user.id)
    if @user.blank?
      render json: { error: 'User not found' }, status: :not_found
    end
  end

  def update
    if current_user.update(profile_params)
      render json: { message: 'Profile updated successfully' }, status: :ok
    else
      render json: { error: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.expect(user: %i[first_name last_name email username])
  end
end
