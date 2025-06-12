class CompanyPolicy < ApplicationPolicy
  def show?
    true
  end

  def update?
    user.has_role?(Role::ADMIN, record)
  end

  def destroy?
    false
  end

  def create?
    false
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
