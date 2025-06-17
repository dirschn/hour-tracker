class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :employments, dependent: :destroy
  has_many :positions, through: :employments
  has_many :companies, through: :positions
  has_many :shifts, through: :employments

  validates :first_name, :last_name, :username, :email, presence: true
  validates :email, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, uniqueness: true, length: { minimum: 3, maximum: 20 }
end
