# now-assessment-downloader
NodeJS script to download multiple assessments from ServiceNow

## Configuration

Do not edit config.json - it's a guide for the configuration options available and provides some defaults

Instead copy config.json to local_config.json and edit that file instead

* username: ServiceNow username
* password: ServiceNow plaintext password
* query: The encoded query of the asmt_assessment_instance table. This will download the associated Excel answers
* instance: The full URL of the ServiceNow instance (no trailing slash)
* output_dir: Where the files should be written to
