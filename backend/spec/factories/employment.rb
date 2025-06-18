FactoryBot.define do
  factory :employment do
    start_date { Faker::Date.between(from: 1.year.ago, to: 6.months.ago) }
    end_date { nil } # Active employment by default
    association :user
    association :position

    trait :ended do
      end_date { Faker::Date.between(from: 3.months.ago, to: 1.month.ago) }
    end

    trait :active do
      end_date { nil }
    end
  end
end
