FactoryBot.define do
  factory :shift do
    date { Date.current }
    start_time { Time.current }
    end_time { nil } # Active shift by default
    association :employment

    trait :completed do
      end_time { start_time + 8.hours }
    end

    trait :active do
      end_time { nil }
    end
  end
end
