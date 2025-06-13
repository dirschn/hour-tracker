class Position < ApplicationRecord
  belongs_to :company

  has_many :employments, dependent: :destroy
  has_many :employees, through: :employments, source: :user
  has_many :shifts, through: :employments

  validates :title, presence: true, uniqueness: { scope: :company_id }
end
