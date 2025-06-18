FactoryBot.define do
  factory :position do
    title { Faker::Job.title }
    description { Faker::Lorem.paragraph(sentence_count: 3) }
    remote { [true, false].sample }
    association :company
  end
end
