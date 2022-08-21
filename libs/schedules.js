const { request, gql } = require('graphql-request');
const gepURL = `https://dev-gep-graphql.wme-digital.com/graphql`;
const legacyScheduleURL = `https://proxy-v4.cms.hbo.com/v1/schedule?date=2022-08-19&zone=east`;
const legacyScheduleEntryURL = (id) => `https://proxy-v4.cms.hbo.com/v1/schedule/programs?focusIds=${id}`;
const fetch = require('node-fetch');
const _ = require('lodash');
const fs = require('fs');

const gepScheduleQuery = gql`
  query {
  getScheduleEntries(
    filters: {
      feed: ["hbo-east"]
      scheduleRange: {
        startDate: "2022-08-19T00:00:00.000Z"
        endDate: "2022-09-15T23:59:59.000Z"
      }
    }
  ) {
    feed
    id
    showId
    titleId
    scheduledTimestamp
    scheduledDuration
    scheduledDurationFormatted(format: "h [hr] m [min]")
    title {
      en_US {
        full
      }
    }
    show {
      ... on Episode {
        type
        id
        gepContentId
        contentAdvisories
        genres
        brand
        images
        ratingCode
        releaseYear
        quality
        title {
          en_US {
            full
          }
        }
        seasonNumber
        episodeNumber
        series {
          title {
            en_US {
              full
            }
          }
        }
        summary {
          en_US {
            full
          }
        }
      }
      ... on Feature {
        type
        id: featureId
        gepContentId
        contentAdvisories
        genres
        brand
        images
        category
        ratingCode
        releaseYear
        quality
        title {
          en_US {
            full
          }
        }
        castAndCrew {
          Cast {
            role {
              firstName
              lastName
            }
            person {
              firstName
              lastName
            }
          }
          Producer {
            person {
              firstName
              lastName
            }
          }
          Director {
            person {
              firstName
              lastName
            }
          }
          Writer {
            person {
              firstName
              lastName
            }
          }
        }
        summary {
          en_US {
            full
          }
        }
      }
    }
    }
}
`

const gepSchedule = async () => {
    const data = await request(gepURL, gepScheduleQuery);
    return data;
}

const legacySchedule = async () => {
    const data = await fetch(legacyScheduleURL).then(res => res.json());
    return data;
}

const getLegacySchedultEntry = (entry) => {

    return fetch(legacyScheduleEntryURL(entry.id)).then(res => res.json());
}

const mergeSchedule = async () => {

    const gepData = await gepSchedule();
    //const legacyData = await legacySchedule();

    const schedule = gepData.getScheduleEntries;
    // const schedule = _.slice(gepData.getScheduleEntries, 0, 10);
    //['titleId', '823081'], ['titleId', '823124']
    // const schedule = _.filter(gepData.getScheduleEntries, (item) => item.titleId === '823081' || item.titleId === '823124');

    const fillData = async (entry) => {
        // find gep entries that match legacy entries and have null as summary
        if (!entry.show?.summary?.en_US?.full) {
            await getLegacySchedultEntry(entry?.show).then(legacyEntry => {
                if (entry.show?.summary === null) {
                    entry.show.summary = { en_US: {} };
                }
                
                entry.show.summary.en_US.full = _.head(legacyEntry?.programs)?.summary || 'no match';
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                // console.log(entry);
            }
            );
        }

        return entry;
    };

    for (const entry of schedule) {
        await fillData(entry);
    }

    // fs.writeFileSync('./schedule.json', JSON.stringify(schedule, null, 4));

    return schedule;

}

module.exports = {
    gepSchedule,
    legacySchedule,
    mergeSchedule
}