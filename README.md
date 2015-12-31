[![](https://badge.imagelayers.io/gaiaadm/agm-issue-change-processor:latest.svg)](https://imagelayers.io/?images=gaiaadm/agm-issue-change-processor:latest 'Get your own badge on imagelayers.io')

*CircleCI:* [![Circle CI](https://circleci.com/gh/gaia-adm/agm-issue-change-processor.svg?style=svg)](https://circleci.com/gh/gaia-adm/agm-issue-change-processor)

# AGM issue change data processor

This is AGM issue change data processor for GAIA analytics. It is based on "gaiaadm/result-processing" Docker image.

Tested with AGM SaaS production (21-Sep-2015)

**Input data format** is exactly as returned by agm Auditing ReST API.
 - Request example: /qcbin/rest/domains/Default/projects/bp1/audits?query={parent-type[defect];parent-id[>0];id[>123]}&page-size=<PAGE_SIZE>&start-index=<i>&order-by={time[asc]}
 - Response example:
 `
 <?xml version="1.0" encoding="UTF-8" standalone="yes"?> 
 <Audits TotalResults="2">
     <Audit>
         <Id>225</Id>
         <Action>UPDATE</Action>
         <ParentId>1</ParentId>
         <ParentType>defect</ParentType>
         <Time>2015-09-01 09:50:04</Time>
         <User>sa</User>
         <Properties>
             <Property Label="Assigned To" Name="owner">
                 <NewValue>sa</NewValue>
                 <OldValue>boris</OldValue>
             </Property>
             <Property Label="Severity" Name="severity">
                 <NewValue>5-Urgent</NewValue>
                 <OldValue>1-Low</OldValue>
             </Property>
         </Properties>
     </Audit>
     <Audit>
         <Id>226</Id>
         <Action>UPDATE</Action>
         <ParentId>1</ParentId>
         <ParentType>defect</ParentType>
         <Time>2015-09-01 09:50:06</Time>
         <User>sa</User>
         <Properties>
             <Property Label="Severity" Name="severity">
                 <NewValue>4-Very High</NewValue>
                 <OldValue>5-Urgent</OldValue>
             </Property>
         </Properties>
     </Audit>
 </Audits>
 `

**Output data format** is exactly as specifed [here](https://github.com/gaia-adm/api-data-format)


## Building

Execute:
- docker build -t gaiaadm/agm-issue-change-processor .

## Running

Execute:
- docker run -d -e AMQ_USER="admin" -e AMQ_PASSWORD="admin" -v "/tmp:/upload" --link rabbitmq-master:amqserver --link mgs:metricsgw --name aic gaiaadm/agm-issue-change-processor
- For development the entire folder of this project can be copied to result-processing\processors directory and the started by server.js of the result-processing project.

Execute tests:
- to run unit tests: grunt unit
- to run code analysis: grunt jshint

Limitations:
- cannot run when RabbitMQ password is empty (common limitations for all data procesors)

## How-to
**generate synthetic data** without having AGM and data collector running (Windows machine, all the names are just examples and can be changed):
- must run: RabbitMQ, results-upload-service
- run the processor at least once without any data to create a queue in RabbitMQ
- create c:\upload folder
- inside c:\upload create 4e516623-dfb8-48f2-9471-06e3bd23caf2 folder with a text file named 2b2d4e25-f9ec-4a09-9b5b-a1774048a5fd
- put to the text file following: <?xml version="1.0" encoding="UTF-8" standalone="yes"?><Audits TotalResults="1"><Audit><Id>14</Id><Action>UPDATE</Action><ParentId>1</ParentId><ParentType>defect</ParentType><Time>2015-08-25 10:11:50</Time><User>sa</User><Properties><Property Label="Severity" Name="severity"><NewValue>3-High</NewValue><OldValue>2-Medium</OldValue></Property></Properties></Audit></Audits>
- login to RabbitMQ and publish message to "agm/issue/change" queue:
 - delivery_mode:	2
 - headers:
   - accessToken: according your real token
   - tenantId: your tenantId
   - path: /upload/4e516623-dfb8-48f2-9471-06e3bd23caf2/2b2d4e25-f9ec-4a09-9b5b-a1774048a5fd
 - payload: {"dataType":"agm/issue/change","C_AGM_LOCATION":"http://belozovs2.hpqcorp.emea.net:8080/qcbin","C_DOMAIN":"Default","C_PROJECT":"bp1","contentType":"application/xml; charset=UTF-8","mimeType":"application/xml","charset":"UTF-8"}
